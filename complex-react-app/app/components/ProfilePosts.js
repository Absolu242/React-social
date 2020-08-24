import React, {useContext, useEffect, useState} from 'react'
import StateContext from '../StateContext'
import Axios from 'axios'
import {useParams, Link} from 'react-router-dom'
import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

function ProfilePosts() {
  const {username} = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const appState = useContext(StateContext)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
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
      {posts.map((post) => {
        return <Post post={post} key={post._id} noAuthor={true} />
      })}
    </div>
  )
}

export default ProfilePosts
