// Example: app/btc/page.tsx
import CryptoRiskCalculator from "../components/CryptoRiskCalculator";

export default function Page() {
  return (
    <CryptoRiskCalculator
      symbol="ETH"
      defaultEntry="3500"
      defaultStop="3400"
    />
  );
}