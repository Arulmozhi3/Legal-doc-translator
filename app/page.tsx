"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, Loader2, Volume2, Eye, EyeOff, Sparkles, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LegalDocumentTranslator() {
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [showMasked, setShowMasked] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError("")
    setAnalysis(null)

    // Read file content
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setFileContent(text)
    }
    reader.readAsText(selectedFile)
  }

  const generateDemoAnalysis = (content: string): any => {
    // Simulate processing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const maskedContent = content
          .replace(/[A-Z][a-z]+ [A-Z][a-z]+/g, "[NAME]")
          .replace(/\d{3}-\d{2}-\d{4}/g, "[SSN]")
          .replace(/\d{3}[-.]?\d{3}[-.]?\d{4}/g, "[PHONE]")
          .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]")
          .replace(/\d{1,5}\s\w+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)/gi, "[ADDRESS]")

        resolve({
          simplifiedText: `This is a demonstration of the AI analysis feature. In real mode with a Google Gemini API key, this section would contain:\n\n• A comprehensive plain-English summary of your legal document\n• Clear explanations of complex legal terms and clauses\n• Important implications and what they mean for you\n\nThe actual AI would analyze the specific content of your document and provide personalized insights about rights, obligations, deadlines, and key terms.`,
          keyPoints: [
            "Demo Mode: This is a simulated analysis to showcase the interface",
            "Real Mode: Connect Google Gemini API for actual AI-powered legal document analysis",
            "Privacy: With API key, your documents are analyzed securely with PII masking",
            "Audio: Text-to-speech works in both demo and real modes for accessibility",
          ],
          maskedText: maskedContent,
        })
      }, 2000)
    })
  }

  const analyzeDocument = async () => {
    if (!fileContent) return

    setLoading(true)
    setError("")
    setShowApiKeyBanner(false)

    try {
      if (demoMode) {
        const demoResult = await generateDemoAnalysis(fileContent)
        setAnalysis(demoResult)
        return
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fileContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setAnalysis(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze document. Please try again."
      setError(errorMessage)
      if (errorMessage.toLowerCase().includes("api key")) {
        setShowApiKeyBanner(true)
      }
      console.error("[v0] Analysis error:", err)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = () => {
    if (!analysis?.simplifiedText) return

    setIsPlayingAudio(true)
    const utterance = new SpeechSynthesisUtterance(analysis.simplifiedText)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onend = () => setIsPlayingAudio(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopAudio = () => {
    window.speechSynthesis.cancel()
    setIsPlayingAudio(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">LegalLens</h1>
              <p className="text-xs text-zinc-400">AI-Powered Legal Literacy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Demo Mode</span>
            <button
              onClick={() => {
                setDemoMode(!demoMode)
                setAnalysis(null)
                setError("")
                setShowApiKeyBanner(false)
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                demoMode ? "bg-blue-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  demoMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {demoMode && (
          <Alert className="mb-8 bg-cyan-500/10 border-cyan-500/30">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <AlertDescription className="text-cyan-300">
              <p className="font-medium">Demo Mode Active</p>
              <p className="text-sm text-cyan-200/80 mt-1">
                You're using simulated AI analysis. Toggle off Demo Mode and add a Google Gemini API key for real
                AI-powered legal document analysis.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {showApiKeyBanner && (
          <Alert className="mb-8 bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <div className="flex flex-col gap-3">
                <p className="font-medium">Google Gemini API Key Required</p>
                <p className="text-sm text-blue-200/80">
                  To use the AI analysis features, you need to add your Google Gemini API key:
                </p>
                <ol className="text-sm text-blue-200/80 space-y-2 ml-4 list-decimal">
                  <li>
                    Get a free API key from{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-100 inline-flex items-center gap-1"
                    >
                      Google AI Studio
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Click the "Vars" button in the left sidebar of this chat</li>
                  <li>Add a new variable named: GOOGLE_GENERATIVE_AI_API_KEY</li>
                  <li>Paste your API key as the value and save</li>
                  <li>Refresh the preview and try analyzing again</li>
                </ol>
                <p className="text-sm text-blue-200/80 mt-2">
                  Or enable <strong>Demo Mode</strong> in the header to test the interface without an API key.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        {!file && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                {demoMode ? "Demo Mode - Try It Out" : "Powered by Google Gemini"}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Understand Legal Documents
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                In Plain English
              </span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Upload any legal document and get AI-powered simplification, key insights, privacy protection, and audio
              explanations.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {!file && (
          <Card className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 transition-colors">
            <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-lg font-medium text-white mb-1">Upload Legal Document</p>
              <p className="text-sm text-zinc-500 mb-4">TXT, DOC, or PDF files supported</p>
              <input type="file" accept=".txt,.doc,.docx,.pdf" onChange={handleFileUpload} className="hidden" />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Choose File</Button>
            </label>
          </Card>
        )}

        {/* Document Processing */}
        {file && !analysis && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{file.name}</h3>
                  <p className="text-sm text-zinc-500">Ready to analyze</p>
                </div>
              </div>

              {error && (
                <Alert className="mb-6 bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={analyzeDocument}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {demoMode ? "Generating Demo Analysis..." : "Analyzing with Gemini..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowMasked(!showMasked)}
                variant="outline"
                className="flex-1 bg-zinc-900/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
              >
                {showMasked ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Original
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Mask Sensitive Data
                  </>
                )}
              </Button>
              <Button
                onClick={isPlayingAudio ? stopAudio : playAudio}
                variant="outline"
                className="flex-1 bg-zinc-900/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlayingAudio ? "Stop Audio" : "Listen to Summary"}
              </Button>
            </div>

            {/* Simplified Summary */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Plain English Summary</h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{analysis.simplifiedText}</p>
              </div>
            </Card>

            {/* Key Information */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Key Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.keyPoints?.map((point: string, index: number) => (
                    <div key={index} className="flex gap-3 p-4 rounded-lg bg-zinc-800/50">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-blue-400">{index + 1}</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Original/Masked Text */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {showMasked ? "Privacy-Protected Version" : "Original Document"}
                </h3>
                <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
                  <p className="text-zinc-400 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {showMasked ? analysis.maskedText : fileContent}
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setFile(null)
                  setAnalysis(null)
                  setFileContent("")
                }}
                variant="outline"
                className="flex-1 bg-zinc-900/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
              >
                Analyze Another Document
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
