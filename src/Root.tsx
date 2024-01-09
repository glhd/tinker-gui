import Loading from "./Loading.tsx";
import Tinker from "./Tinker.tsx";
import useWorkingDirectory from "./useWorkingDirectory.ts";

export default function Root() {
	const cwd = useWorkingDirectory();
	
	return cwd ? <Tinker cwd={ cwd } /> : <Loading />;
}
