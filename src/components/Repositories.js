import React, { useCallback, useState } from 'react'
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core'
import startCase from 'lodash.startcase'

import Repository from './Repository'
import useApi from '../hooks/useApi'

export default function Repositories({ installationId }) {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [{ data, loading }] = useApi({
    url: `/repositories/${installationId}`,
    params: {
      per_page: pageSize,
      page: pageNumber,
    },
  })

  const handleChangePage = useCallback((_, page) => setPageNumber(page + 1), [])

  const handleChangeRowsPerPage = useCallback(e => {
    setPageSize(e.target.value)
    setPageNumber(1)
  }, [])

  if (loading) {
    return (
      <Box m={2}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Repository</TableCell>
            <TableCell>Stars</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Checked</TableCell>
            {Object.keys(data.repositories?.[0]?.status?.checks || {}).map(
              k => (
                <TableCell key={k}>{startCase(k)}</TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.repositories.map(repo => (
            <Repository key={repo.id} repository={repo} />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              page={pageNumber - 1}
              rowsPerPage={pageSize}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              count={data.total_count}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}
