import React from 'react'
import Page from './Page'
import {Link} from 'react-router-dom'

export default function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>We cannot find that page </h2>
        <div className="lead text-muted">
          You can visit <Link to="/">the homepage</Link>{' '}
        </div>
      </div>
    </Page>
  )
}
