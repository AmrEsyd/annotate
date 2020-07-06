import { fabric } from 'fabric-pure-browser'
import { useEffect, useState } from 'react'

export const useImage = (imageUrl: string | undefined | null) => {
  const [image, setImage] = useState<fabric.Image | null>(null)

  useEffect(() => {
    if (imageUrl)
      fabric.Image.fromURL(
        imageUrl,
        (newImage) => {
          setImage(newImage)
        },
        { excludeFromExport: true, crossOrigin: 'anonymous' }
      )
  }, [imageUrl])

  return [image]
}
