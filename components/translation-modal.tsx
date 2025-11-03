"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Languages, Globe, Wand2 } from "lucide-react"
import GoogleTranslate from "./google-translate"
import { toast } from "@/hooks/use-toast"

interface TranslationModalProps {
  children: React.ReactNode
  initialText?: string
  onTranslationComplete?: (translatedText: string, targetLanguage: string) => void
}

const languages = [
  { code: "en", name: "English" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
]

export default function TranslationModal({ children, initialText = "", onTranslationComplete }: TranslationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sourceText, setSourceText] = useState(initialText)
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("it")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const handleUseTranslation = () => {
    if (translatedText && onTranslationComplete) {
      onTranslationComplete(translatedText, targetLanguage)
      setIsOpen(false)
      toast({
        title: "Translation Applied",
        description: "The translated text has been applied",
      })
    }
  }

  const handleManualTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)

    try {
      // Using a simple translation API (you can replace this with your preferred service)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLanguage}|${targetLanguage}`,
      )
      const data = await response.json()

      if (data.responseData && data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText)
      } else {
        throw new Error("Translation failed")
      }
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try using Google Translate.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translation Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Google Translate
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Manual Translation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Google Translate Integration</CardTitle>
                <CardDescription>
                  Use Google's translation service to translate content in real-time. The page will be translated
                  automatically when you select a language.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Text</Label>
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <Label className="text-sm font-medium mb-2 block">Google Translate Widget</Label>
                  <GoogleTranslate pageLanguage={sourceLanguage} includedLanguages="en,it,ar,fr,es,de,pt,ru,zh,ja" />
                  <p className="text-xs text-gray-600 mt-2">
                    Select a language from the dropdown above to translate the entire page content.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleCopyText(sourceText)} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Source
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Source Text</CardTitle>
                  <div className="flex gap-2">
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="min-h-[200px]"
                  />
                  <Button onClick={() => handleCopyText(sourceText)} variant="outline" size="sm" className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Source Text
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Translated Text</CardTitle>
                  <div className="flex gap-2">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                    placeholder="Translation will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleManualTranslate}
                      disabled={isTranslating || !sourceText.trim()}
                      className="flex-1"
                    >
                      {isTranslating ? "Translating..." : "Translate"}
                    </Button>
                    <Button onClick={() => handleCopyText(translatedText)} variant="outline" disabled={!translatedText}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {translatedText && (
              <div className="flex justify-end">
                <Button onClick={handleUseTranslation} className="bg-green-600 hover:bg-green-700">
                  Use This Translation
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
