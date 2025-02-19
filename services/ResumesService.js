const BrowserService = require("./BrowserService");
const path = require("path");
const fs = require("fs");
const Moment = require("moment");
const postmark = require("postmark");
const CookiesService = require("./cookiesService");
const candidatesQurey = require("./graphQl/queries/candidatesQurey");
const { GraphQLClient } = require("graphql-request");
const { setTimeout } = require("timers/promises");

let ResumesService = {};

ResumesService.transferResumesOfCandidatesList = async (candidatesList) => {
	if (!BrowserService.page) {
		await BrowserService.getNewBrowser();
		await setTimeout(1000);
		await BrowserService.page.goto("https://employers.indeed.com/jobs");
	}

	let numberOfResumesSent = 0;
	for (const candidate of candidatesList) {
		try {
			if (!candidate.jobEmail) {
				console.log(`This Candidate has no email : ${candidate.jobTitle}`);
				continue;
			}

			// delete old folder
			await ResumesService.deleteCandidateFolder(candidate);

			// download candidates resume
			await ResumesService.downloadResumeForCandidate(candidate);

			await ResumesService.sendEmail(candidate);

			// delete the resume folder
			await ResumesService.deleteCandidateFolder(candidate);
			numberOfResumesSent++;
		} catch (error) {
			console.log("--------------------------------");
			console.log({ error });
			console.log("--------------------------------");
		}
	}
	console.log(
		`${numberOfResumesSent}/ ${candidatesList.length} resumes were sent successfully`
	);
};

ResumesService.getCandidatesBetweenTwoDates = async (startDate, endDate) => {
	const headers = await CookiesService.getHeaders();
	const variables = {
		useExplainerPlatform: true,
		useRequirementMatchSnippets: true,
		input: {
			filter: {
				submissionType: "LEGACY",
				created: {
					createdAfter: new Date(startDate).getTime(),
					createdBefore: new Date(endDate).getTime(),
				},
				hiringMilestones: {
					milestoneIds: [
						"NEW",
						"PHONE_SCREENED",
						"INTERVIEWED",
						"OFFER_MADE",
						"REVIEWED",
					],
				},
			},
			sortBy: [
				{
					sortField: "DATE_CREATED",
					sortOrder: "DESCENDING",
				},
				{
					sortField: "NAME",
					sortOrder: "ASCENDING",
				},
			],
		},
		first: 1000,
	};
	const client = new GraphQLClient(
		"https://apis.indeed.com/graphql?locale=en-US&co=US",
		{
			headers: {
				...headers,
				"indeed-client-sub-app": "job-posting",
				"indeed-client-sub-app-component": "./JobDescriptionSheet",
			},
		}
	);
	let data;
	try {
		data = await client.request(candidatesQurey, variables);
	} catch (error) {
		if (error.response && error.response.data && error.response.data.findCandidateSubmissions) {
			data = error.response.data;
		}
		else {
			throw error;
		}
	}
	const candidates = data.findCandidateSubmissions.candidateSubmissions.map(
		(item) => {
			return {
				id: item.id,
				name: item.data?.profile?.name?.displayName,
				createdStamp: item.data?.created,
				createdDate: Moment(item.data?.created)?.format("YYYY-MM-DD"),
				phoneNumber: item.data?.profile?.contact?.phoneNumber,
				location: item.data?.profile?.location?.location,
				downloadUrl: item.data?.resume?.downloadUrl,
				jobTitle: item.data?.jobs?.edges[0]?.node?.jobData?.title,
				jobEmail:
					item.data?.jobs?.edges[0]?.node?.jobData?.applyMethod?.emails?.[0],
			};
		}
	);
	if (candidates.length > 0) {
		console.log("returning candidates");
		return candidates;
	} else {
		throw Error("No Candidates were found for this date range");
	}
};

ResumesService.deleteCandidateFolder = async (candidate) => {
	let folderPath = path.join(__dirname, "..", "resumes", candidate.id);
	try {
		fs.rmSync(folderPath, { recursive: true });
	} catch { }
};

ResumesService.downloadResumeForCandidate = async (candidate) => {
	const client = await BrowserService.page.target().createCDPSession();
	await client.send('Page.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath: path.join(__dirname, "..", "resumes", candidate.id),
	});

	try {
		await BrowserService.page.evaluate(() => window.stop());
		await BrowserService.page.goto(candidate.downloadUrl);
	} catch { }
	await setTimeout(4000);
};

ResumesService.getResumeName = async (candidate) => {
	//construct the path
	let fileToCheckPath = path.join(__dirname, "..", "resumes", candidate.id);

	//get files in path
	let filesInPath = fs.readdirSync(fileToCheckPath);

	for (const fileName of filesInPath) {
		if (fileName.includes("Resume")) {
			return fileName;
		}
	}

	return false;
};

ResumesService.sendEmail = async (candidate) => {
	let resumeName = await ResumesService.getResumeName(candidate);

	if (!resumeName) {
		throw Error(
			`${candidate.name} :  Resume wan't downloaded please try again`
		);
	}

	try {
		let resumePath = path.join(
			__dirname,
			"..",
			"resumes",
			candidate.id,
			resumeName
		);

		// Send an email:
		var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

		//Step 2: Setting up message options
		const SENDER_EMAIL = "resumes@jeanshorts.careers";
		let messageParams = {
			From: SENDER_EMAIL,
			To: candidate.jobEmail,
			Subject: candidate.name,
			TextBody: candidate.jobTitle,
			MessageStream: "outbound",
		};

		// read the resume file, add it to the attachements then send the email
		const data = await fs.promises.readFile(resumePath, { encoding: "base64" });
		const file = {
			Name: resumeName,
			Content: data,
			ContentType: "application/octet-stream",
		};
		messageParams.Attachments = [file];
		if (candidate.jobEmail) {
			await client.sendEmail(messageParams);
			console.log(`${candidate.name} was sent successfully ! `);
		}
	} catch (err) {
		console.log("Error code : ", err);
		console.log(
			"Error : coudlnt send email for this resume : ",
			candidate.name
		);
	}
};

module.exports = ResumesService;
