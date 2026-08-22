import { RegionalRadar } from "@/components/RegionalRadar";
import { loadSignalArchive } from "@/data/loadSignalArchive";

export default function Home() {
  return <RegionalRadar archive={loadSignalArchive()} />;
}
