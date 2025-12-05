"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  notifications: z.boolean(),
  soundEffects: z.boolean(),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
})

export function UserSettingsForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
  name: user?.name || "",
  email: user?.email || "",
  notifications: user?.preferences?.notifications ?? true,
  soundEffects: user?.preferences?.soundEffects ?? true,
  autoStartBreaks: user?.preferences?.autoStartBreaks ?? false,
  autoStartPomodoros: user?.preferences?.autoStartPomodoros ?? false,
},

  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:5000/api/auth/updateuser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token || "",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          preferences: {
            notifications: values.notifications,
            soundEffects: values.soundEffects,
            autoStartBreaks: values.autoStartBreaks,
            autoStartPomodoros: values.autoStartPomodoros,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings")
      }

      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Preferences</h3>
            <p className="text-sm text-muted-foreground">Customize your Pomodoro experience</p>
          </div>

          {[
            { name: "notifications", label: "Notifications", desc: "Receive notifications when sessions end" },
            { name: "soundEffects", label: "Sound Effects", desc: "Play sounds when sessions start and end" },
            { name: "autoStartBreaks", label: "Auto-start Breaks", desc: "Automatically start breaks when a session ends" },
            { name: "autoStartPomodoros", label: "Auto-start Pomodoros", desc: "Automatically start focus sessions after breaks" },
          ].map(({ name, label, desc }) => (
            <FormField
              key={name}
              control={form.control}
              name={name as keyof z.infer<typeof formSchema>}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{label}</FormLabel>
                    <FormDescription>{desc}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </Form>
  )
}
