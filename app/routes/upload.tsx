

import { prepareInstructions } from "constants2";
import { convertPdfToImage } from "lib/pdf2img";
import { usePuterStore } from "lib/puter";
import { generateUUID } from "lib/utils";
import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

import FileUploader from "~/compnents/FileUploader";
import Navbar from "~/compnents/Navbar";


const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsprocessing] = useState(false);
    const [statusText, setStatusText] = useState('')
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        {
            setIsprocessing(true)
            setStatusText('Uploading the file...')
            const uploadedFile = await fs.upload([file])
            if (!uploadedFile) return setStatusText("Error :failed to upload file")
            setStatusText('Converting to image...')
            const imageFile = await convertPdfToImage(file)
            if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

            setStatusText('Uploading the image')
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage)
                return setStatusText("Error :failed to upload file")
            setStatusText('Preparing data...')
            const uuid = generateUUID();

            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                feedback: ''
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data))
            setStatusText('Analyzing....')

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) return setStatusText('Error:failes to analyze resume')

            const feedbackText = typeof feedback.message.content == 'string' ? feedback.message.content :
                feedback.message.content[0].text

            data.feedback = JSON.parse(feedbackText)

            kv.set(`resume:${uuid}`, JSON.stringify(data))
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            navigate(`/resume/${uuid}`)

        }

    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const form = e.currentTarget.closest('form')
        if (!form) return;
        const formData = new FormData(form)

        const companyName = formData.get('company-name') as string
        const jobTitle = formData.get('job-title') as string
        const jobDescription = formData.get('company-name') as string

        if (!file) return
        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }
    return (

        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>
                        smart feedback for your dream job
                    </h1>
                    {isProcessing ? (
                        <>
                            <h2>
                                {statusText}
                                <img src="/images/resume-scan.gif" className="w-full"></img>
                            </h2>
                        </>
                    ) : (
                        <h2>
                            Drop youe resume for an ATS
                        </h2>
                    )
                    }
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">
                                    Company Name
                                </label>
                                <input type="text" name="company-name" placeholder="Company Name" id="comapny-name"></input>
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">
                                    Job Title
                                </label>
                                <input type="text" name="job-title" placeholder="Job Title" id="Job Title"></input>
                            </div>

                            <div className="form-div">
                                <label htmlFor="Job-descrption">
                                    Job Descrption
                                </label>
                                <input type="text" name="Job-Descrption" placeholder="Job Descrption" id="Job Descrption"></input>
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">
                                    Upload Resume
                                </label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
                <button className="primiary-button" type="submit">

                </button>

            </section>
        </main>
    )
}

export default Upload