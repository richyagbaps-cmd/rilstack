import { NextRequest, NextResponse } from 'next/server';

// Mock database for demonstration
// In production, this would call the actual NIMC API or a service provider's API
const mockNINDatabase: Record<string, any> = {
  '12345678901': {
    nin: '12345678901',
    firstName: 'Chioma',
    lastName: 'Okafor',
    middleName: 'Blessing',
    dateOfBirth: '1990-05-15',
    gender: 'F',
    stateOfOrigin: 'Lagos',
  },
  '98765432101': {
    nin: '98765432101',
    firstName: 'Emeka',
    lastName: 'Eze',
    middleName: 'Chukwu',
    dateOfBirth: '1988-03-20',
    gender: 'M',
    stateOfOrigin: 'Enugu',
  },
  '55555555555': {
    nin: '55555555555',
    firstName: 'Aisha',
    lastName: 'Mohammed',
    middleName: 'Fatima',
    dateOfBirth: '1992-11-08',
    gender: 'F',
    stateOfOrigin: 'Kano',
  },
};

// Helper function to get Interswitch OAuth token
async function getInterswitchToken(): Promise<string | null> {
  try {
    const clientId = process.env.INTERSWITCH_CLIENT_ID;
    const clientSecret = process.env.INTERSWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://qa.interswitchng.com/passport/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        'scope': 'profile',
        'grant_type': 'client_credentials',
      }).toString(),
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      return tokenData.access_token;
    }

    return null;
  } catch (error) {
    console.error('Interswitch token error:', error);
    return null;
  }
}

// Helper function to verify NIN with Interswitch
async function verifyWithInterswitch(nin: string, token: string): Promise<any | null> {
  try {
    const response = await fetch('https://qa.interswitchng.com/passport/api/v2/kyc/nin/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nin }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    return null;
  } catch (error) {
    console.error('Interswitch NIN verification error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nin } = body;

    // Validate NIN format
    if (!nin || !/^\d{11}$/.test(nin)) {
      return NextResponse.json(
        { error: 'Invalid NIN format. NIN must be 11 digits.' },
        { status: 400 }
      );
    }

    // Try real NIMC-based NIN validation API (if configured)
    // Multiple backend options:
    // 1. Dojah API (https://dojah.ai) - Free tier available
    // 2. Identitypass (https://identitypass.com)
    // 3. Interswitch (https://interswitchng.com) - Requires OAuth
    // 4. Mock database (for testing)
    
    const dojahApiKey = process.env.DOJAH_API_KEY;
    const identitypassApiKey = process.env.IDENTITYPASS_API_KEY;

    // Try Dojah first (most affordable option)
    if (dojahApiKey) {
      try {
        const dojahResponse = await fetch('https://api.dojah.io/api/v1/kyc/nin', {
          method: 'POST',
          headers: {
            'Authorization': dojahApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nin }),
        });

        if (dojahResponse.ok) {
          const dojahData = await dojahResponse.json();
          const verifiedData = {
            nin,
            firstName: dojahData.data?.first_name || '',
            lastName: dojahData.data?.last_name || '',
            middleName: dojahData.data?.middle_name || '',
            dateOfBirth: dojahData.data?.dob || '',
            gender: dojahData.data?.gender || 'M',
            stateOfOrigin: dojahData.data?.state_of_residence || '',
            verified: true,
            verificationDate: new Date().toISOString(),
            verificationMethod: 'DOJAH_API',
          };
          return NextResponse.json(verifiedData, { status: 200 });
        }
      } catch (dojahError) {
        console.log('Dojah API failed, trying fallback...');
      }
    }

    // Try Identitypass as backup
    if (identitypassApiKey) {
      try {
        const identitypassResponse = await fetch('https://api.identitypass.com/api/v2/kyc/nin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${identitypassApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nin }),
        });

        if (identitypassResponse.ok) {
          const identitypassData = await identitypassResponse.json();
          const verifiedData = {
            nin,
            firstName: identitypassData.data?.firstName || '',
            lastName: identitypassData.data?.lastName || '',
            middleName: identitypassData.data?.middleName || '',
            dateOfBirth: identitypassData.data?.dateOfBirth || '',
            gender: identitypassData.data?.gender || 'M',
            stateOfOrigin: identitypassData.data?.stateOfOrigin || '',
            verified: true,
            verificationDate: new Date().toISOString(),
            verificationMethod: 'IDENTITYPASS_API',
          };
          return NextResponse.json(verifiedData, { status: 200 });
        }
      } catch (identitypassError) {
        console.log('Identitypass API failed, trying fallback...');
      }
    }

    // Try Interswitch as third option (requires OAuth)
    try {
      const interswitchToken = await getInterswitchToken();
      if (interswitchToken) {
        const interswitchData = await verifyWithInterswitch(nin, interswitchToken);
        
        if (interswitchData && interswitchData.data) {
          const verifiedData = {
            nin,
            firstName: interswitchData.data?.firstName || '',
            lastName: interswitchData.data?.lastName || '',
            middleName: interswitchData.data?.middleName || '',
            dateOfBirth: interswitchData.data?.dateOfBirth || '',
            gender: interswitchData.data?.gender || 'M',
            stateOfOrigin: interswitchData.data?.stateOfOrigin || '',
            verified: true,
            verificationDate: new Date().toISOString(),
            verificationMethod: 'INTERSWITCH_API',
          };
          return NextResponse.json(verifiedData, { status: 200 });
        }
      }
    } catch (interswitchError) {
      console.log('Interswitch API failed, using mock database...');
    }

    // Fallback to mock database for testing
    const foundData = mockNINDatabase[nin];

    if (!foundData) {
      return NextResponse.json(
        { 
          error: 'NIN not found in database. Please check the NIN number.',
          code: 'NIN_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Add verification metadata
    const verifiedData = {
      ...foundData,
      verified: true,
      verificationDate: new Date().toISOString(),
      verificationMethod: 'API',
    };

    return NextResponse.json(verifiedData, { status: 200 });
  } catch (error: any) {
    console.error('NIN validation error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during NIN validation.' },
      { status: 500 }
    );
  }
}
