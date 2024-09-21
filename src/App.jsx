/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import Icon from "react-icons-kit";
import { search } from "react-icons-kit/feather/search";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { droplet } from "react-icons-kit/feather/droplet";
import { wind } from "react-icons-kit/feather/wind";
import { activity } from "react-icons-kit/feather/activity";
import { useDispatch, useSelector } from "react-redux";
import { get5DaysForecast, getCityData } from "./Store/Slices/WeatherSlice.jsx";
import { SphereSpinner } from "react-spinners-kit";

const hostName=import.meta.env.VITE_API_HOSTNAME;
const appId=import.meta.env.VITE_WEATHER_API_KEY;

// CityDropdown component
const CityDropdown = ({ filteredCities, onSelectCity, loading }) => {
  return (
    <div className="dropdown-container">
      <div className="dropdown-list">
        {filteredCities.map((city, index) => (
          <div
            key={index}
            className="dropdown-item"
            onClick={() => onSelectCity(city)}
          >
            {city}
          </div>
        ))}
      </div>
    </div>
  );
};

// ForecastCard component
const ForecastCard = ({ day, icon, description, maxTemp, minTemp }) => {
  return (
    <div className="forecast-box">
      <h5>{day}</h5>
      <img src={`https://openweathermap.org/img/wn/${icon}.png`} alt="icon" />
      <h5>{description}</h5>
      <h5 className="min-max-temp">
        {maxTemp}&deg; / {minTemp}&deg;
      </h5>
    </div>
  );
};

function App() {
  // Redux state
  const {
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
  } = useSelector((state) => state.weather);

  // Main loading state
  const [loadings, setLoadings] = useState(true);

  // Main city input state
  const [city, setCity] = useState("New Delhi");

  // Filtered cities for dropdown
  const [filteredCities, setFilteredCities] = useState([]);

  // Unit state (metric or imperial)
  const [unit, setUnit] = useState("metric");

  // Dropdown visibility
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Dispatch function from redux
  const dispatch = useDispatch();

  // Example cities data for dropdown
  const cities = ["New York", "New Delhi", "Tokyo", "Paris", "London"];

  // Check if any loading state is still true
  const allLoadings = [citySearchLoading, forecastLoading];
  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  // Handle city search input change
  const handleCitySearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setCity(e.target.value);

    const filtered = cities.filter((city) =>
      city.toLowerCase().startsWith(searchTerm)
    );
    setFilteredCities(filtered);
    setDropdownVisible(searchTerm.length > 0); // Show dropdown only if there's a search term
  };

  // Handle city selection from dropdown
  const handleSelectCity = (selectedCity) => {
    setCity(selectedCity); // Update the input box with the selected city
    setDropdownVisible(false); // Hide the dropdown
    fetchData(selectedCity); // Fetch weather data for the selected city
  };

  // Fetch city and forecast data
  const fetchData = (cityToFetch = city) => {
    dispatch(getCityData({ city: cityToFetch, unit })).then((res) => {
      if (!res.payload.error) {
        dispatch(
          get5DaysForecast({
            lat: res.payload.data.coord.lat,
            lon: res.payload.data.coord.lon,
            unit,
          })
        );
      }
    });
  };

  // Fetch initial data on mount or unit change
  useEffect(() => {
    fetchData();
  }, [unit]);

  // Handle city search form submit
  const handleCitySearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Toggle between metric and imperial units
  const toggleUnit = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  // Filter forecast data by first object time
  const filterForecastByFirstObjTime = (forecastData) => {
    if (!forecastData) {
      return [];
    }

    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

  return (
    <div className="background">
      <div className="box">
        {/* City search form */}
        <form autoComplete="off" onSubmit={handleCitySearch}>
          <label>
            <Icon icon={search} size={20} />
          </label>
          <input
            type="text"
            className="city-input"
            placeholder="Enter City"
            required
            value={city}
            onChange={handleCitySearchChange} // Filter cities dynamically
            onFocus={() => setDropdownVisible(true)} // Show dropdown on focus
            readOnly={loadings}
          />
          <button type="submit">Search</button>
        </form>

        {/* Dropdown for city search */}
        {dropdownVisible && (
          <CityDropdown
            filteredCities={filteredCities} // Pass filtered cities
            onSelectCity={handleSelectCity}
            loading={loadings}
          />
        )}

        {/* Current weather details */}
        <div className="current-weather-details-box">
          <div className="details-box-header">
            <h4>Current Weather</h4>
            <div className="switch" onClick={toggleUnit}>
              <div
                className={`switch-toggle ${unit === "metric" ? "c" : "f"}`}
              ></div>
              <span className="c">C</span>
              <span className="f">F</span>
            </div>
          </div>
          {loadings ? (
            <div className="loader">
              <SphereSpinner loadings={loadings} color="#2fa5ed" size={20} />
            </div>
          ) : (
            <>
              {citySearchData && citySearchData.error ? (
                <div className="error-msg">{citySearchData.error}</div>
              ) : (
                <>
                  {forecastError ? (
                    <div className="error-msg">{forecastError}</div>
                  ) : (
                    <>
                      {citySearchData && citySearchData.data ? (
                        <div className="weather-details-container">
                          <div className="details">
                            <h4 className="city-name">
                              {citySearchData.data.name}
                            </h4>

                            <div className="icon-and-temp">
                              <img
                                src={`https://openweathermap.org/img/wn/${citySearchData.data.weather[0].icon}@2x.png`}
                                alt="icon"
                              />
                              <h1>{citySearchData.data.main.temp}&deg;</h1>
                            </div>

                            <h4 className="description">
                              {citySearchData.data.weather[0].description}
                            </h4>
                          </div>

                          {/* Other weather metrics */}
                          <div className="metrices">
                            <h4>
                              Feels like {citySearchData.data.main.feels_like}
                              &deg;C
                            </h4>

                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={arrowUp} size={20} />
                                <span className="value">
                                  {citySearchData.data.main.temp_max}&deg;C
                                </span>
                              </div>
                              <div className="key">
                                <Icon icon={arrowDown} size={20} />
                                <span className="value">
                                  {citySearchData.data.main.temp_min}&deg;C
                                </span>
                              </div>
                            </div>

                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={droplet} size={20} />
                                <span>Humidity</span>
                              </div>
                              <div className="value">
                                {citySearchData.data.main.humidity}%
                              </div>
                            </div>

                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={wind} size={20} />
                                <span>Wind</span>
                              </div>
                              <div className="value">
                                {citySearchData.data.wind.speed}kph
                              </div>
                            </div>

                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={activity} size={20} />
                                <span>Pressure</span>
                              </div>
                              <div className="value">
                                {citySearchData.data.main.pressure}hPa
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* 5 days forecast */}
        <div className="extended-forecasts-container">
          {filteredForecast?.length > 0 &&
            filteredForecast.map((forecast) => (
              <div className="forecast-box" key={forecast.dt}>
                {/* Displaying the day */}
                <h5>
                  {new Date(forecast.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </h5>

                {/* Weather icon */}
                <img
                  src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                  alt={forecast.weather[0].description}
                />

                {/* Weather description */}
                <h5>{forecast.weather[0].description}</h5>

                {/* Min and Max temperatures */}
                <h5 className="min-max-temp">
                  {Math.round(forecast.main.temp_max)}&deg; /{" "}
                  {Math.round(forecast.main.temp_min)}&deg;
                </h5>
              </div>
              
            ))}
        </div>
        <p style={{textAlign:"center", paddingTop:"20px", fontSize:"30px", color:"#fff"}}>&copy;Ritik Singh</p>
      </div>
    </div>
  );
}

export default App;
