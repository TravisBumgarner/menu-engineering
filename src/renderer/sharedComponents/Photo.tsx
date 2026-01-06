import { useQuery } from "@tanstack/react-query"
import { CHANNEL } from '../../shared/messages.types'
import { QUERY_KEYS } from "../consts"
import ipcMessenger from '../ipcMessenger'
import HtmlTooltip from "./HtmlTooltip"
import Icon from "./Icon"

export const uint8ArrayToObjectUrl = (
    bytes: Uint8Array,
    mime = 'image/jpeg',
) => {
    const copy = new Uint8Array(bytes) // forces ArrayBuffer
    const blob = new Blob([copy], { type: mime })
    return URL.createObjectURL(blob)
}

type LocalPhoto = {
    data: File
    type: 'local'
}

type BackendPhoto = {
    src: string
    type: 'backend'

}


const LocalPhoto = (props: { data: File }) => {
    return (<HtmlTooltip
        placement="top"
        title={
            <img src={URL.createObjectURL(props.data)} alt="Recipe Photo" style={{ display: 'block', padding: 0, margin: 0, maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
        }
    >
        <span>
            <Icon name='photo' />
        </span>
    </HtmlTooltip >)
}

const BackendPhoto = (props: { src: string }) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: [QUERY_KEYS.PHOTO, props.src],
        queryFn: async () => {
            const response = await ipcMessenger.invoke(CHANNEL.FILES.GET_PHOTO, { fileName: props.src })
            return response.data ? uint8ArrayToObjectUrl(response.data) : null
        }
    })

    return (
        <HtmlTooltip
            placement="top"
            title={
                isLoading ? 'Loading...' : isError ? `Error: ${error}` : data ? <img src={data} alt="Recipe Photo" style={{ display: 'block', padding: 0, margin: 0, maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} /> : 'No Photo'
            }
        >
            <span>
                <Icon name='photo' />
            </span>
        </HtmlTooltip >
    )
}


const Photo = (props: LocalPhoto | BackendPhoto) => {
    if (props.type === 'local') {
        return <LocalPhoto data={props.data} />
    } else if (props.type === 'backend') {
        return <BackendPhoto src={props.src} />
    }
    return null
}

export default Photo