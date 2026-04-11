"use client";
import { useState } from "react";
import PinConfirmModal from "@/components/PinConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import DemographicsForm from "@/components/DemographicsForm";

const CATEGORIES = [
  { key: "needs", label: "Needs (50%)" },
  { key: "wants", label: "Wants (30%)" },
  { key: "savings", label: "Savings (20%)" },
];

export default function Relaxed502030Page() {
  return <DemographicsForm mode="relaxed" type="502030" />;
}
