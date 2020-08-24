import React, {useContext, useEffect, useState} from 'react'
import StateContext from '../StateContext'
import Axios from 'axios'
import {useParams, Link} from 'react-router-dom'
import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'

function ProfileFollowers() {
  const {username} = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const appState = useContext(StateContext)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`, {
          cancelToken: ourRequest.token,
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log('there was a problem')
      }
    }

    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )
  }
  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />
            {follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowers
