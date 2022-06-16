const fs = require("fs");
const glob = require("fast-glob");
const path = require("path");
const yaml = require("js-yaml");

describe("Test-Suite Lesson Resources Check", () => {
	const indexFiles = glob.sync("src/content/**/index.yml");
	let resources = [];

	for (const i of indexFiles) {
		const [doc] = yaml.load(fs.readFileSync(i, "utf8"));

		if (doc.type === "flyer") {
			const stepFolderPath = path.dirname(i);
			const stepName = doc.src;
			const activityFilePath = `${stepFolderPath}/${stepName}.yml`;
			const { segments } = yaml.load(fs.readFileSync(activityFilePath, "utf8"));

			for (segment in segments) {
				for (property in segments[segment]) {
					let resourceFolder = "";
					let resourceUrl = "";

					switch (property) {
						case "flyer":
							resourceFolder = "img";
							break;
						case "expectation":
							resourceFolder = "expect";
							break;
						case "startVoiceOver":
							resourceFolder = "voice";
							break;
						case "listenAudioCue":
						case "playAudioCue":
						case "backingTrack":
							resourceFolder = "audio";
							break;
						case "handvideo":
							resourceFolder = "video";
							break;
					}

					if (resourceFolder) {
						const resourceRef = segments[segment][property].src;

						if (resourceRef.slice(0, 3) === "/l/") {
							const { dir, base } = path.parse(resourceRef.slice(3));
							resourceUrl = `src/content/shared/${resourceFolder}/${dir ? dir + "/" : ""}en/${base}`;
						} else if (resourceRef[0] === "/") {
							resourceUrl = `src/content/shared/${resourceFolder}/${resourceRef.slice(1)}`;
						} else if (resourceRef.slice(0, 2) === "l/") {
							const { dir, base } = path.parse(resourceRef.slice(2));
							resourceUrl = `${stepFolderPath}/${resourceFolder}/${dir ? dir + "/" : ""}en/${base}`;
						} else {
							resourceUrl = `${stepFolderPath}/${resourceFolder}/${resourceRef}`;
						}
						resources.push([resourceUrl, segment, property, activityFilePath]);
					}
				}
			}
		}
	}
	resources.forEach(([resourceUrl, segment, property, activityFilePath]) => {
		test(`${resourceUrl}, referenced by ${segment}.${property} of ${activityFilePath} exists`, () => {
			expect(fs.existsSync(resourceUrl)).toBe(true);
		});
	});
});
