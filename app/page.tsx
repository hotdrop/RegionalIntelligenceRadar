import { RegionalRadar } from "@/components/RegionalRadar";
import { loadSignalArchive } from "@/lib/loadSignalArchive";

export default function Home() {
  return <RegionalRadar archive={loadSignalArchive()} />;
}
