import { Calculator } from "../components/Calculator";

export default function Page() {
  return (
    <Calculator
      symbol="BNB/USDT"
      defaultEntry="600"
      defaultStop="590"
    />
  );
}
