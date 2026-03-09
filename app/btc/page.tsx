// Example: app/btc/page.tsx
import CryptoRiskCalculator from "../components/CryptoRiskCalculator";

export default function Page() {
  return (
    <CryptoRiskCalculator
      symbol="BTC"
      defaultEntry="92000"
      defaultStop="88000"
    />
  );
}