import React, { useCallback, useState } from 'react'
import {
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
import useGithub from '../hooks/useGithub'
import Repository from './Repository'

export default function Repositories({ installationId }) {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [{ data, loading }] = useGithub({
    url: `/user/installations/${installationId}/repositories`,
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
    return <CircularProgress />
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
            <TableCell>Delete branch on merge</TableCell>
            <TableCell>Default branch</TableCell>
            <TableCell>Default branch protected</TableCell>
            <TableCell>Enforce default branch protection on admins</TableCell>
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
