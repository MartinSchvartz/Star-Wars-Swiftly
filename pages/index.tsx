import { useState, useMemo, useEffect, useCallback } from "react";
import DefaultLayout from "@/layouts/default";

import SearchBar from "@/components/search-bar";

import { getCharacters, search } from "@/services/starWarsService";
import useDebounce from "@/hooks/useDebounce";
import CustomTable from "@/components/custom-table";

export default function IndexPage({
  initialData,
}: {
  initialData: ResponseInfo;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [data, setData] = useState<ResponseInfo>();
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isInvalid, setIsInvalid] = useState(false);

  const [page, setPage] = useState<number>(1);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = page === 1 ? initialData : await getCharacters(page);
      setData(response);
    } finally {
      setIsLoading(false);
      setIsInvalid(false);
    }
  }, [page, initialData]);

  useEffect(() => {
    isSearching ? null : fetchCharacters();
  }, [fetchCharacters]);

  useEffect(() => {
    if (searchQuery !== "") {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const debouncedRequest = useDebounce(async () => {
    const searchResults = await search(searchQuery);

    if (searchResults.length === 0) {
      setErrorMessage("Could not find any results.");
      setIsInvalid(true);
      setIsLoading(false);
    }

    setData({ characters: searchResults, count: searchResults.length });
    setIsSearching(false);
  }, 400);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    setSearchQuery(searchTerm);

    if (searchTerm === "") {
      fetchCharacters();
      return;
    }

    setIsInvalid(false);

    debouncedRequest();
  };

  const rowsPerPage = 10;

  const handleClear = () => {
    setSearchQuery("");
    setIsInvalid(false);
    fetchCharacters();
  };
  const pages = useMemo(() => {
    return data?.count ? Math.ceil(data.count / rowsPerPage) : 0;
  }, [data, rowsPerPage]);

  return (
    <DefaultLayout>
      <SearchBar
        isSearching={isSearching}
        placeholder="Enter character's name, home world or species..."
        className="mb-4"
        onChange={handleChange}
        onClear={handleClear}
        isInvalid={isInvalid}
        errorMessage={errorMessage}
      />
      <CustomTable
        data={data}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pages={pages}
        rowsPerPage={rowsPerPage}
      />
    </DefaultLayout>
  );
}
export const getServerSideProps = async () => {
  const response = await getCharacters(1);

  return {
    props: {
      initialData: response,
    },
  };
};
