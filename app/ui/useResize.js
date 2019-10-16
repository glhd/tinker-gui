import { useEffect, useState } from 'react';

export default function useResize() {
	const getSize = () => ({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	
	const [size, setSize] = useState(getSize);
	
	useEffect(() => {
		let frame;
		const listener = e => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => setSize(getSize()));
		};
		window.addEventListener('resize', listener, false);
		return () => window.removeEventListener('resize', listener);
	}, []);
	
	return size;
}
