import countries from "world-countries";

export type Country = {
  value: string;
  label: string;
  latlng: number[];
  region: string;
};

const formattedCountries: Country[] = countries.map((country) => ({
  value: country.name.common,
  label: `${country.name.common} ${country.flag}`,
  latlng: country.latlng,
  region: country.region,
}));

const useCountries = () => {
  const getAll = (): Country[] => formattedCountries;
  return { getAll };
};

export default useCountries;
