"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import LegalDocumentModal from "@/app/components/ui/public/appointment/LegalDocumentModal";
import { privacyPolicySections, publicOfferSections, } from "@/app/(public)/appointment/legalDocuments";
type DocumentType = "privacy" | "offer" | null;
interface LegalDocumentContextType {
  isOpen: boolean;
  documentType: DocumentType;
  openPrivacyPolicy: () => void;
  openPublicOffer: () => void;
  close: () => void;
}
const LegalDocumentContext = createContext<LegalDocumentContextType | undefined>(undefined);
export function LegalDocumentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const openPrivacyPolicy = () => {
    setDocumentType("privacy");
    setIsOpen(true);
  };
  const openPublicOffer = () => {
    setDocumentType("offer");
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };
  const getSections = () => {
    if (documentType === "privacy") return privacyPolicySections;
    if (documentType === "offer") return publicOfferSections;
    return [];
  };
  const getTitle = () => documentType === "privacy" ? "Политика конфиденциальности" : "Публичная оферта";
  const getSubtitle = () => documentType === "privacy" ? "Документ описывает, какие персональные данные собираются при онлайн-записи, зачем они нужны и как пользователь может управлять своими правами." : "Документ фиксирует условия онлайн-записи, общие правила оказания услуг и базовые обязанности исполнителя и клиента.";
  const getEffectiveDate = () => "14 мая 2026";
  return (
    <LegalDocumentContext.Provider value={{ isOpen, documentType, openPrivacyPolicy, openPublicOffer, close }}>
      {children}
      {isOpen && documentType && (
        <LegalDocumentModal
          isOpen={isOpen}
          onClose={close}
          title={getTitle()}
          subtitle={getSubtitle()}
          effectiveDate={getEffectiveDate()}
          sections={getSections()}
        />
      )}
    </LegalDocumentContext.Provider>
  );
}
export function useLegalDocument() {
  const context = useContext(LegalDocumentContext);
  if (!context) throw new Error("useLegalDocument must be used within LegalDocumentProvider");
  return context;
}
