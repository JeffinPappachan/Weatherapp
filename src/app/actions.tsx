"use server";

import { z } from "zod";

// Define the weather schema for validation
const weatherSchema = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number(),
  }),
  weather: z.array(
    z.object({
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),
  wind: z
    .object({
      speed: z.number(),
    })
    .optional(),
});

export type WeatherData = z.infer<typeof weatherSchema>;

export async function getWeatherData(city: string): Promise<{
  data?: WeatherData;
  error?: string;
}> {
  try {
    if (!city.trim()) {
      return { error: "City name cannot be empty" };
    }
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`
    );

    if (!res.ok) {
      return { error: "City not found" };
    }
    const rawdata = await res.json();
    const data = weatherSchema.parse(rawdata);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid weather data receieved" };
    }
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch weather data",
    };
  }
}
