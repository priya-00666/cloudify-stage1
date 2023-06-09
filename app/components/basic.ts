/**
 * Components exposed from here are available for all widgets (built-in and custom through Stage.Basic global).
 *
 * Remember to update `widgets-components.md` file in https://github.com/cloudify-cosmo/docs.getcloudify.org
 * whenever you change list of exported components in this file.
 */

import {
    Alert,
    ApproveButton,
    CancelButton,
    Checkmark,
    Confirm,
    CopyToClipboardButton,
    DataSegment,
    DataTable,
    DateInput,
    DateRangeInput,
    Dropdown,
    EditableLabel,
    ErrorMessage,
    Form,
    FullScreenSegment,
    GenericField,
    HighlightText,
    KeyIndicator,
    LabelsList,
    Loading,
    LoadingOverlay,
    Logo,
    Menu,
    MessageContainer,
    Modal,
    NodesTree,
    Popup,
    PopupConfirm,
    PopupHelp,
    PopupMenu,
    ReadmeModal,
    ResourceVisibility,
    VisibilityField,
    VisibilityIcon
} from 'cloudify-ui-components';

import { CircleMarker, FeatureGroup, Map, Marker, Popup as LeafletPopup, TileLayer, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import {
    Accordion,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Container,
    Dimmer,
    Divider,
    Grid,
    Header,
    Icon,
    Image,
    Input,
    Item,
    Label,
    List,
    Loader,
    Message,
    Portal,
    Progress,
    Radio,
    Ref,
    Segment,
    Sidebar,
    Step,
    Tab,
    Table
} from 'semantic-ui-react';

Modal.defaultProps = {
    ...Modal.defaultProps,
    closeOnDimmerClick: false
};

const Leaflet = {
    Map,
    TileLayer,
    Marker,
    Popup: LeafletPopup,
    Tooltip,
    FeatureGroup,
    CircleMarker,
    MarkerClusterGroup
};

export {
    Accordion,
    Alert,
    ApproveButton,
    Breadcrumb,
    Button,
    CancelButton,
    Card,
    Checkbox,
    Checkmark,
    Confirm,
    Container,
    CopyToClipboardButton,
    DateInput,
    DateRangeInput,
    DataSegment,
    DataTable,
    Dimmer,
    Divider,
    Dropdown,
    EditableLabel,
    ErrorMessage,
    Form,
    FullScreenSegment,
    GenericField,
    Grid,
    Header,
    HighlightText,
    Icon,
    Image,
    Input,
    Item,
    KeyIndicator,
    Label,
    LabelsList,
    Leaflet,
    List,
    Loader,
    Loading,
    LoadingOverlay,
    Logo,
    Menu,
    Message,
    MessageContainer,
    Modal,
    NodesTree,
    Popup,
    PopupConfirm,
    PopupHelp,
    PopupMenu,
    Portal,
    Progress,
    Radio,
    ResourceVisibility,
    ReadmeModal,
    Ref,
    Segment,
    Sidebar,
    Step,
    Tab,
    Table,
    VisibilityIcon,
    VisibilityField
};
