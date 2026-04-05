@echo off
cd C:\Users\hp\.ms-ad
git add .
git commit -m "Deploy - %date% %time%"
git push origin main
echo DONE - Check Vercel dashboard
pause