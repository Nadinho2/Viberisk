// Example: app/btc/page.tsx
import CryptoRiskCalculator from "../components/CryptoRiskCalculator";

export default function Page() {
  return (
    <CryptoRiskCalculator
      symbol="BNB"
      defaultEntry="600"
      defaultStop="590"
    />
  );
}