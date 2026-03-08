// Example: app/btc/page.tsx
import CryptoRiskCalculator from "../components/CryptoRiskCalculator";

export default function Page() {
  return (
    <CryptoRiskCalculator
      symbol="XAUT/USDT"
      defaultEntry="2650"
      defaultStop="2600"
    />
  );
}