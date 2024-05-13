import { Input, Kbd } from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import cn from "classnames";
import { Spinner } from "@nextui-org/react";
type Props = {
  className?: string;
  placeholder: string;
  ariaLabel: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  isInvalid: boolean;
  errorMessage: string;
  isSearching?: boolean;
};
const SearchBar = ({
  className,
  placeholder,
  ariaLabel,
  onChange,
  onClear,
  isInvalid,
  errorMessage,
  isSearching,
}: Props) => {
  return (
    <Input
      className={cn(className)}
      onClear={onClear}
      isClearable
      aria-label={ariaLabel}
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      onChange={onChange}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      placeholder={placeholder}
      startContent={
        isSearching ? (
          <Spinner size="sm" />
        ) : (
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        )
      }
    />
  );
};

SearchBar.defaultProps = {
  placeholder: "Search...",
  ariaLabel: "Search",
  isInvalid: false,
  errorMessage: "Could not find any results.",
};

export default SearchBar;
