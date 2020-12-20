import React from 'react'
import { Link, TableCell, TableRow } from '@material-ui/core'

function check(value) {
  if (value === true) {
    return '✔️'
  }

  if (value === false) {
    return '❌'
  }

  return '-'
}

export default function Repository({ repository }) {
  return (
    <TableRow>
      <TableCell>
        <Link target="_blank" color="textPrimary" href={repository.html_url}>
          {repository.name}
        </Link>
      </TableCell>
      <TableCell>{repository.stargazers_count}</TableCell>
      <TableCell>{repository.private ? '🔒' : '🌍'}</TableCell>
      <TableCell>{new Date(repository.created_at).toLocaleString()}</TableCell>
      <TableCell>
        {new Date(repository.status?.lastChecked).toLocaleString()}
      </TableCell>
      {Object.entries(repository.status?.checks || {}).map(([k, v]) => (
        <TableCell key={k}>{check(v)}</TableCell>
      ))}
    </TableRow>
  )
}
