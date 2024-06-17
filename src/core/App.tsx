import WeatherDisplay from "../features/weather/WeatherDisplay";
import Header from "../components/Header";
import SuggestionDisplay from "../features/suggestions/SuggestionDisplay";
import { useWeatherData } from "../hooks/api/useWeatherData";
import { useEffect, useState } from "react";
import { GeocodingData, QueryData } from "../types/types";
import { usePromptDataBase } from "../hooks/openAI/usePromptDataBase";
import { useAIResponse } from "../hooks/openAI/useAIResponse";
import { useAirPollutionData } from "../hooks/api/useAirPollutionData";
import { useForecastData } from "../hooks/api/useForecastData";
import WeatherForecast from "../features/weather/WeatherForecast";

const App: React.FC = () => {
  //---Geocoding Hooks---

  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingData | null>(null);

  //---Weather Hooks---

  const {
    isPending,
    isFetching: isWeatherFetching,
    data,
    error,
  } = useWeatherData(
    selectedLocation?.lat || null,
    selectedLocation?.lon || null
  );

  //---Forecast Hooks---

  const forecastData = useForecastData(
    selectedLocation?.lat || null,
    selectedLocation?.lon || null
  );

  useEffect(() => {
    console.log("Forecast Data: ", forecastData.data);
  }, [forecastData.data]);

  //---Air Pollution Hooks---

  const airPollutionData = useAirPollutionData(
    selectedLocation?.lat || null,
    selectedLocation?.lon || null
  );

  //---AI Hooks---

  const [aiData, setAiData] = useState<QueryData>({
    isPending: false,
    data: null,
    error: null,
  });

  const prompt = usePromptDataBase(data);

  const { refetch, isFetching: isAIFetching } = useAIResponse(
    prompt.systemMessage,
    prompt.userMessage
  );

  useEffect(() => {
    setAiData((prev) => ({
      ...prev,
      isPending: isAIFetching,
    }));
  }, [isAIFetching]);

  //---AI Request Function---

  const getWeatherAdvice = async () => {
    setAiData((prev) => ({
      ...prev,
      isPending: true,
    }));
    try {
      const { data: aiResponse, error: aiError } = await refetch();
      setAiData({
        isPending: false,
        data: aiResponse,
        error: aiError,
      });
    } catch (error) {
      setAiData({
        isPending: false,
        data: null,
        error: error,
      });
    }
  };

  return (
    <main className="flex flex-col items-center gap-8">
      <Header
        title="WeatherWise.ai"
        setSelectedLocation={setSelectedLocation}
      />
      <div className="flex flex-col items-center gap-8 w-full">
        <WeatherDisplay
          selectedLocation={selectedLocation}
          weatherData={{ isPending, isWeatherFetching, data, error }}
          airPollutionData={airPollutionData}
          aiData={aiData}
          aiRequest={getWeatherAdvice}
        />
        <WeatherForecast forecastData={forecastData} />
        <SuggestionDisplay aiData={aiData} />
      </div>
    </main>
  );
};

export default App;
