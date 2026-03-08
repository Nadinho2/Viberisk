import { Calculator } from "../components/Calculator";

export default function Page() {
  return (
    <Calculator
      symbol="BTC/USDT"
      defaultEntry="60000"
      defaultStop="59000"
    />
  );
}
