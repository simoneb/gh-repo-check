import React, { useCallback } from 'react'
import { CircularProgress, Link, TableCell, TableRow } from '@material-ui/core'
import { useQuery } from 'graphql-hooks'

export default function Repository({ repository }) {
  const { data, loading } = useQuery(
    `
  query Repository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      deleteBranchOnMerge
      defaultBranchRef {
        name
        branchProtectionRule {
          isAdminEnforced
        }
      }
    }
  }`,
    {
      variables: {
        owner: repository.owner.login,
        name: repository.name,
      },
    }
  )

  const spin = useCallback(
    v => (loading ? <CircularProgress size={10} /> : v(data.repository)),
    [loading, data]
  )

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
      <TableCell>{spin(r => (r.deleteBranchOnMerge ? '☑️' : '❌'))}</TableCell>
      <TableCell>{spin(r => r.defaultBranchRef?.name || '-')}</TableCell>
      <TableCell>
        {spin(r =>
          r.defaultBranchRef
            ? r.defaultBranchRef.branchProtectionRule
              ? '☑️'
              : '❌'
            : '-'
        )}
      </TableCell>
      <TableCell>
        {spin(r =>
          r.defaultBranchRef?.branchProtectionRule
            ? r.defaultBranchRef.branchProtectionRule.isAdminEnforced
              ? '☑️'
              : '❌'
            : '-'
        )}
      </TableCell>
    </TableRow>
  )
}
