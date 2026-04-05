@echo off
cd C:\Users\hp\.ms-ad
echo === STAGING ===
git add .
echo === COMMITTING ===
git commit -m "Add Resend email + OPay wallet - %date% %time%"
echo === PUSHING ===
git push origin main
echo.
echo === DEPLOYMENT TRIGGERED ===
echo Check: https://vercel.com/dashboard
pause