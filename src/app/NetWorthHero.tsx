import React from "react";
import PrivacyAmount from "@/components/PrivacyAmount";
import BudgetingFlowModal from "../components/BudgetingFlowModal";

export default function NetWorthHero() {
  const [netWorth, setNetWorth] = React.useState(0);
  const [showBudgetModal, setShowBudgetModal] = React.useState(false);
  React.useEffect(() => {
    let start = 0;
    const end = 1234567;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setNetWorth(end);
        clearInterval(interval);
      } else {
        setNetWorth(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleAddMoney = () => window.location.href = '/account';
  const handleCreateBudget = () => setShowBudgetModal(true);
  const handleSetSavingsGoal = () => window.location.href = '/savings-goals';

  return (
    <>
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-10 mt-4 sm:mt-8 mb-8 flex flex-col items-center relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="bg-[#00e096] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#00c080] transition" onClick={handleAddMoney}>Add Money</button>
          <button className="bg-[#2c3e5f] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#1a2253] transition" onClick={handleCreateBudget}>Create Budget</button>
          <button className="bg-[#FFD700] text-[#2c3e5f] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffe066] transition" onClick={handleSetSavingsGoal}>Set Savings Goal</button>
        </div>
        <div className="text-xs uppercase tracking-widest text-[#4A5B6E] mb-2">Total Net Worth</div>
        <div className="text-5xl sm:text-6xl font-extrabold text-[#2c3e5f] mb-4 animate-pulse">
          <PrivacyAmount amount={netWorth} />
        </div>
        <div className="w-full flex flex-col gap-2 items-center">
          <div className="w-full h-4 bg-[#f3f4fa] rounded-full overflow-hidden flex">
            <div className="h-4 bg-[#FFD700]" style={{ width: '40%' }}></div>
            <div className="h-4 bg-[#00e096]" style={{ width: '35%' }}></div>
            <div className="h-4 bg-[#2c3e5f]" style={{ width: '25%' }}></div>
          </div>
          <div className="flex justify-between w-full text-xs mt-1">
            <span className="text-[#FFD700]">Investments 40%</span>
            <span className="text-[#00e096]">Savings 35%</span>
            <span className="text-[#2c3e5f]">Cash 25%</span>
          </div>
        </div>
      </div>
      <BudgetingFlowModal open={showBudgetModal} onClose={() => setShowBudgetModal(false)} />
    </>
  );
}