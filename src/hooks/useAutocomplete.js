import { useQuery } from 'react-query';

const fetchAllFunctions = async () => {
  try {
    const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
    if (!response.ok) {
      throw new Error('Failed to fetch functions');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching functions:', error);
    return [];
  }
};

const useAutocomplete = (query) => {
  const { data: allFunctions = [], isLoading } = useQuery(
    'functions',
    fetchAllFunctions,
    {
      staleTime: Infinity, // Never consider the data stale since it's static
      cacheTime: Infinity, // Keep the data cached indefinitely
      retry: 2
    }
  );

  // Filter functions based on query
  const suggestions = !query ? [] : allFunctions.filter(fn => {
    if (!fn || typeof fn !== 'object') return false;
    
    const name = fn.name?.toLowerCase() || '';
    const description = fn.description?.toLowerCase() || '';
    const searchTerm = query.toLowerCase();
    
    return name.includes(searchTerm) || description.includes(searchTerm);
  });

  return { suggestions, isLoading };
};

export default useAutocomplete;
