import { Calculator } from "../components/Calculator";

export default function Page() {
  return (
    <Calculator
      symbol="SOL/USDT"
      defaultEntry="180"
      defaultStop="170"
    />
  );
}
