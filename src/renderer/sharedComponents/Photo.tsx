import HtmlTooltip from "./HtmlTooltip"
import Icon from "./Icon"

type LocalPhoto = {
    data: File
}

type BackendPhoto = {
    src: string

}


const Photo = (props: LocalPhoto | BackendPhoto) => {
    return (<HtmlTooltip
        placement="top"
        title={
            <img src={'src' in props ? props.src : URL.createObjectURL(props.data)} alt="Recipe Photo" style={{ display: 'block', padding: 0, margin: 0, maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
        }
    >
        <span>
            <Icon name='photo' />
        </span>
    </HtmlTooltip >)
}

export default Photo