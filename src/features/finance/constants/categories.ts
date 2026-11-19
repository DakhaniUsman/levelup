import {
  Coffee,
  Home,
  Zap,
  Heart,
  Navigation,
  Film,
  Users,
  CircleDot,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { ExpenseCategory } from "@/models/Expense";

export interface CategoryMetadata {
  value: ExpenseCategory;
  label: string;
  icon: LucideIcon;
  defaultBudget: number;
  description: string;
}

export const STANDARD_CATEGORIES: CategoryMetadata[] = [
  {
    value: "FOOD",
    label: "Food & Meals",
    icon: Coffee,
    defaultBudget: 7000,
    description: "Meals, groceries, dining & nutritional supplements",
  },
  {
    value: "RENT",
    label: "Rent",
    icon: Home,
    defaultBudget: 5000,
    description: "Monthly accommodation / PG / house rent",
  },
  {
    value: "ELECTRICITY_BILL",
    label: "Electricity Bill (EB)",
    icon: Zap,
    defaultBudget: 500,
    description: "Electricity & power utility payments",
  },
  {
    value: "HOME_SUPPORT",
    label: "Home",
    icon: Heart,
    defaultBudget: 10000,
    description: "Money transferred to family & household support",
  },
  {
    value: "TRAVELLING",
    label: "Travelling / Commute",
    icon: Navigation,
    defaultBudget: 2000,
    description: "Metro, fuel, cabs & daily commute",
  },
  {
    value: "ENTERTAINMENT",
    label: "Entertainment",
    icon: Film,
    defaultBudget: 2000,
    description: "Subscriptions, movies & recreation",
  },
  {
    value: "OUTING",
    label: "Outing & Social",
    icon: Users,
    defaultBudget: 2000,
    description: "Social gatherings, events & dining out with friends",
  },
  {
    value: "PERSONAL",
    label: "Personal Care",
    icon: Sparkles,
    defaultBudget: 2000,
    description: "Grooming, apparel & self care",
  },
  {
    value: "MISCELLANEOUS",
    label: "Miscellaneous",
    icon: CircleDot,
    defaultBudget: 3000,
    description: "General unplanned expenses & supplies",
  },
];

const CATEGORY_LABEL_MAP: Record<string, string> = {
  FOOD: "Food & Meals",
  RENT: "Rent",
  ELECTRICITY_BILL: "Electricity Bill (EB)",
  EB: "Electricity Bill (EB)",
  HOME_SUPPORT: "Home",
  HOME: "Home",
  TRAVELLING: "Travelling / Commute",
  TRAVEL: "Travelling / Commute",
  ENTERTAINMENT: "Entertainment",
  OUTING: "Outing & Social",
  PERSONAL: "Personal Care",
  MISCELLANEOUS: "Miscellaneous",
  MISC: "Miscellaneous",
};

/**
 * Formats any raw category key (standard or custom) into a human-readable display label
 */
export function formatCategoryLabel(rawCategory: string | undefined | null): string {
  if (!rawCategory) return "Miscellaneous";
  const key = rawCategory.trim().toUpperCase();
  if (CATEGORY_LABEL_MAP[key]) {
    return CATEGORY_LABEL_MAP[key];
  }
  // Title case for dynamic custom categories (e.g. "INVESTMENTS" -> "Investments")
  return rawCategory
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Retrieves the matching Lucide icon for a given category
 */
export function getCategoryIcon(rawCategory: string | undefined | null): LucideIcon {
  if (!rawCategory) return CircleDot;
  const key = rawCategory.trim().toUpperCase();
  const found = STANDARD_CATEGORIES.find(
    (c) => c.value === key || (key === "EB" && c.value === "ELECTRICITY_BILL") || (key === "HOME" && c.value === "HOME_SUPPORT")
  );
  if (found) return found.icon;
  if (key.includes("RENT") || key.includes("HOUSE")) return Home;
  if (key.includes("POWER") || key.includes("ELECTRIC") || key.includes("BILL")) return Zap;
  if (key.includes("FAMILY") || key.includes("HOME")) return Heart;
  return Tag;
}
