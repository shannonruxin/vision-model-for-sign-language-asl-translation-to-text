export interface CoordRow {
	time: string;
	x: number;
	y: number;
	z: number;
};
  
export interface SingleLandmarkData { // one body part; array of [x,y,z] for a single hand/pose
	coordinates: number[][]; 
	label?: string; // optional label like "hand1" or "pose"
}

export interface LandmarksData { // all body parts; [x, y, z] data for hands (both) and pose
  hands: number[][][]; // each hand: array of [x,y,z]
  pose: number[][];    // pose: array of [x,y,z]
};