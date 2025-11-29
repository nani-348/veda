export interface PlantAnalysisResult {
  identified: boolean;
  commonName?: string;
  botanicalName?: string;
  ayurvedicName?: string;
  family?: string;
  shortDescription?: string;
  medicinalUses?: string[];
  preparationMethods?: Array<{
    methodName: string;
    instructions: string;
  }>;
  dosage?: {
    children: string;
    adults: string;
    elderly: string;
  };
  safetyWarnings?: string[];
  ayurvedicProperties?: {
    rasa?: string; // Taste
    virya?: string; // Potency
    vipaka?: string; // Post-digestive effect
    doshaKarma?: string; // Effect on doshas
  };
  confidenceScore: number; // 0 to 100
  safetyProfileScore: number; // 1 to 10 (10 being safest)
}
