'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

interface ChatFormData {
  userMessage: string;
}

interface AIChatbotProps {
  onClose?: () => void;
}

// AI responses database (mock implementation)
const getAIResponse = (userInput: string): string => {
  const lowerInput = userInput.toLowerCase();

  // Greeting responses
  if (lowerInput.match(/hello|hi|hey|greetings|good morning|good afternoon|good evening/i)) {
    return "👋 Hello! I'm RILSTACK's AI Assistant. I'm here to help you with budgeting, savings, investments, and financial planning questions. How can I assist you today?";
  }

  // Locked Savings Questions
  if (lowerInput.match(/locked savings|lock period|hourly|daily|monthly|yearly lock/i)) {
    return "🔒 **Locked Savings Explanation:**\n\nLocked Savings helps enforce disciplined saving by preventing access to funds until the unlock date:\n\n⏰ **Hourly Lock** - 0.5% APY\n📅 **Daily Lock** - 2% APY\n📆 **Monthly Lock** - 4.5% APY\n📊 **Yearly Lock** - 7.2% APY\n\nInterest is calculated and paid to you when the lock period ends. This feature is perfect for building savings discipline!";
  }

  // Budget Questions
  if (lowerInput.match(/budget|50-30-20|zero-based|spending/i)) {
    return "💰 **Budget Models Explained:**\n\n**50/30/20 Model:**\n- 50% Needs (Housing, Food, Utilities)\n- 30% Wants (Entertainment, Dining)\n- 20% Savings & Investments\n\n**Zero-Based Budgeting:**\n- Allocate every naira to a specific category\n- Better control over discretionary spending\n\nWhich model works best for you depends on your income stability and goals. Would you like tips on identifying your expenses?";
  }

  // Investment Questions
  if (lowerInput.match(/investment|stocks|bonds|mutual funds|t-bills|returns|interest/i)) {
    return "📈 **Investment Options in RILSTACK:**\n\n**T-Bills** (5-6% APY)\n- Government securities, low-risk\n- Short-term returns\n\n**Bonds** (4-5% APY)\n- Fixed income investments\n- Regular interest payments\n\n**Mutual Funds** (7-10% APY)\n- Professionally managed portfolios\n- Close-ended funds with sale cycles\n\nDiversification is key. Don't put all funds in one investment type. What's your risk tolerance?";
  }

  // Savings Goals
  if (lowerInput.match(/savings goal|emergency|vacation|education|target/i)) {
    return "🎯 **Setting Savings Goals:**\n\n1. **Define Your Goal** - Be specific (e.g., 'Emergency Fund of ₦500,000')\n2. **Set a Deadline** - Realistic timeline matters\n3. **Calculate Monthly Savings** - Break goal into monthly amounts\n4. **Track Progress** - Monitor with our dashboard\n5. **Stay Disciplined** - Use locked savings for accountability\n\nCommon goals: Emergency fund (3-6 months expenses), Vacation, Education, Home down payment.\n\nWhat goal would you like to set?";
  }

  // Risk Management
  if (lowerInput.match(/risk|conservative|aggressive|portfolio|diversify/i)) {
    return "⚠️ **Risk Management in Investing:**\n\n**Conservative Strategy:**\n- 60% Bonds/T-Bills, 40% Savings\n- Lower returns, stable growth\n\n**Moderate Strategy:**\n- 50% Bonds, 30% Mutual Funds, 20% T-Bills\n- Balanced risk and returns\n\n**Aggressive Strategy:**\n- 50% Mutual Funds, 40% Stocks, 10% Bonds\n- Higher returns, more volatility\n\nConsider your age, income, and financial goals when choosing your strategy.";
  }

  // NIN Validation
  if (lowerInput.match(/nin|validation|identity|verify|national id/i)) {
    return "🆔 **NIN Validation Process:**\n\nOur NIN Validation system:\n✓ Validates your 11-digit NIN\n✓ Auto-populates your profile with verified details\n✓ Ensures KYC compliance\n✓ Secure verification with NIMC standards\n\nBenefits:\n- Quick profile setup\n- Enhanced security\n- Full access to RILSTACK features\n- Regulatory compliance\n\nGo to the 'NIN Validation' section to get started!";
  }

  // Account Management
  if (lowerInput.match(/account|deposit|withdraw|balance|transaction|payment method/i)) {
    return "🏦 **Account Management:**\n\n**Deposit Methods:**\n💳 Card - Credit/Debit cards\n🏦 Transfer - Bank transfers\n📱 USSD - Mobile money via USSD\n\n**Balance Types:**\n💚 **Total Balance** - All your funds\n💙 **Available Balance** - Ready to withdraw\n💜 **Locked/Invested** - In investments or locked savings\n\nTrack all transactions in your account history. What would you like to do?";
  }

  // Financial Tips
  if (lowerInput.match(/tips|advice|financial|planning|help|best practice/i)) {
    return "💡 **Financial Tips:**\n\n1. **Start with Emergency Fund** - Save 3-6 months of expenses\n2. **Use Locked Savings** - Enforce discipline with time-locked funds\n3. **Diversify Investments** - Don't put all eggs in one basket\n4. **Track Expenses** - Know where your money goes\n5. **Automate Savings** - Set up regular transfers\n6. **Review Monthly** - Check budget and goals progress\n7. **Avoid Impulsive Spending** - Use 24-hour rule for big purchases\n8. **Plan for Taxes** - Set aside funds for tax obligations\n\nWhat specific area would you like help with?";
  }

  // Income & Expenses
  if (lowerInput.match(/income|expense|salary|spending|cost|bills/i)) {
    return "💸 **Income vs Expenses:**\n\n**Understanding Your Money:**\n- **Income** - All money coming in (salary, side hustle, returns)\n- **Fixed Expenses** - Rent, utilities, insurance (must pay)\n- **Variable Expenses** - Groceries, transport (flexible)\n- **Discretionary Expenses** - Entertainment, shopping (optional)\n\n**Goal:** Expenses < Income\n\nUse our Budget tools to categorize and track everything. Try the 50/30/20 model if you're just starting!";
  }

  // Wealth Building
  if (lowerInput.match(/wealth|build|retire|future|long-term|compound/i)) {
    return "🌟 **Building Wealth for the Future:**\n\n**Key Principles:**\n1. **Start Early** - Compound interest is your friend\n2. **Invest Consistently** - Regular contributions matter more than timing\n3. **Reinvest Returns** - Let interest compound\n4. **Minimize Fees** - Can significantly impact long-term wealth\n5. **Tax Efficiency** - Structure investments wisely\n6. **Patience** - Wealth building is a marathon, not a sprint\n\n**15-Year Plan Example:**\n- ₦50,000/month in 7% investments = ₦12M+ with compound interest\n\nWould you like help creating a wealth-building plan?";
  }

  // Tax Questions
  if (lowerInput.match(/tax|deduction|withholding|payment|irs|cra|revenue/i)) {
    return "📊 **Tax Considerations:**\n\nIn Nigeria:\n- **Income Tax** - Payroll tax (PAYE) usually automatic\n- **Investment Returns** - Some investments have withholding taxes\n- **Capital Gains** - Taxed in some situations\n- **Business Income** - May require separate filing\n\n**Tips:**\n- Keep investment statements for tax purposes\n- Report all income sources\n- Track deductible expenses\n- Consider tax-efficient investment strategies\n\nConsult a tax professional for personalized advice!";
  }

  // Feature Overview
  if (lowerInput.match(/feature|rilstack|what|available|platform/i)) {
    return "📱 **RILSTACK Features Overview:**\n\n📊 **Dashboard** - Financial overview and quick insights\n💰 **Budget** - 50/30/20 and zero-based budgeting\n🎯 **Savings Goals** - Track goals with deadlines\n🔒 **Locked Savings** - Time-locked funds with interest\n📈 **Investments** - T-Bills, Bonds, Mutual Funds\n🏦 **Account** - Balance, transactions, deposits/withdrawals\n🤖 **AI Assistant** - Me! Financial guidance\n🆔 **NIN Validation** - Identity verification & auto-population\n\nEach feature is designed to help you achieve financial freedom!";
  }

  // Default responses
  if (lowerInput.match(/thankyou|thanks|thank you|appreciate|good idea/i)) {
    return "😊 You're welcome! I'm here whenever you need financial guidance. Feel free to ask anything about budgeting, savings, or investing!";
  }

  if (lowerInput.match(/bye|goodbye|see you|exit|quit|farewell/i)) {
    return "👋 Goodbye! Remember: Start small, stay consistent, and build wealth one naira at a time. See you soon!";
  }

  // Default response
  return "🤔 Great question! I'm still learning about that topic. Here's what I can help with:\n\n- 📊 Budget planning and tracking\n- 🎯 Savings goals and strategies\n- 📈 Investment planning\n- 🔒 Locked savings benefits\n- 💳 Account management\n- 💡 Financial tips and advice\n- 🆔 NIN validation\n\nTry asking me about any of these topics, or feel free to ask your question differently!";
};

export default function AIChatbot({ onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      message: "👋 Welcome to RILSTACK AI Assistant! I'm here to help you with financial planning, budgeting, savings strategies, and investment advice.\n\nYou can ask me about:\n• Budget models and expense tracking\n• Locked savings strategies\n• Investment options\n• Savings goals\n• Financial tips\n• Account management\n• And much more!\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChatFormData>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (data: ChatFormData) => {
    const userMessage = data.userMessage.trim();

    if (!userMessage) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      message: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    reset();
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage);
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newAIMessage]);
      setIsLoading(false);
    }, 800);
  };

  const suggestedQuestions = [
    '💡 Financial Planning Tips',
    '🔒 How do Locked Savings work?',
    '💰 50/30/20 Budget Explained',
    '📈 Investment Strategies',
    '🆔 NIN Validation Process',
  ];

  return (
    <div className="w-96 max-h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-lg font-bold">🤖 AI Assistant</h2>
          <p className="text-xs text-blue-100">Financial guidance</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded transition-all text-xl"
            title="Minimize chat"
          >
            ✖️
          </button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="mb-2 space-y-1">
            <p className="text-gray-600 text-xs font-semibold">💡 Quick tips:</p>
            <div className="space-y-1">
              {suggestedQuestions.slice(0, 3).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    reset({ userMessage: question });
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      form.dispatchEvent(new Event('submit', { bubbles: true }));
                    }
                  }}
                  className="w-full text-left p-1 bg-blue-50 border border-blue-300 rounded text-xs text-gray-700 hover:bg-blue-100 hover:border-blue-500 font-medium transition-all line-clamp-1"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded text-sm ${
                msg.type === 'user'
                  ? 'bg-blue-800 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.message.substring(0, 80)}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.type === 'user' ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('en-NG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-300 p-3 shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask..."
            {...register('userMessage')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-800 text-white font-bold px-3 py-2 rounded hover:bg-blue-900 transition-all disabled:opacity-50 text-sm"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
