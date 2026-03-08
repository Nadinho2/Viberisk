import { Calculator } from "../components/Calculator";

export default function Page() {
  return (
    <Calculator
      symbol="ETH/USDT"
      defaultEntry="3500"
      defaultStop="3400"
    />
  );
}
