import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  getKeyValue,
} from "@nextui-org/react";
type Props = {
  data?: ResponseInfo;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  pages: number;
  rowsPerPage: number;
};
const CustomTable = ({
  data,
  isLoading,
  page,
  setPage,
  pages,
  rowsPerPage,
}: Props) => {
  return (
    <Table
      layout="fixed"
      aria-label="Example table with client async pagination"
      className="mb-8"
      bottomContent={
        pages > 0 && (data?.characters?.length ?? 0) <= rowsPerPage ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null
      }
    >
      <TableHeader>
        <TableColumn className="text-base" key="name">
          Name
        </TableColumn>
        <TableColumn className="text-base" key="homeworld">
          Home World
        </TableColumn>
        <TableColumn className="text-base" key="species">
          Species
        </TableColumn>
      </TableHeader>
      <TableBody
        items={data?.characters ?? []}
        loadingContent={<Spinner />}
        isLoading={isLoading}
        emptyContent={
          "Sorry there is no info that matches your search, try again with something different!"
        }
      >
        {(item: CharacterCard) => (
          <TableRow key={Math.random()}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
export default CustomTable;
