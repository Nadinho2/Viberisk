// Example: app/btc/page.tsx
import CryptoRiskCalculator from "../components/CryptoRiskCalculator";

export default function Page() {
  return (
    <CryptoRiskCalculator
      symbol="SOL"
      defaultEntry="200"
      defaultStop="180"
    />
  );
}