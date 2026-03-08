import { Calculator } from "../components/Calculator";

export default function Page() {
  return (
    <Calculator
      symbol="XAUT/USDT"
      defaultEntry="2650"
      defaultStop="2600"
    />
  );
}
