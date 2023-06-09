import type { ElkExtendedEdge } from 'elkjs/lib/elk-api';

const GraphEdge = ({ graphEdge: edge }: { graphEdge: ElkExtendedEdge }) => {
    const { startPoint } = edge.sections![0];
    const { bendPoints } = edge.sections![0];
    const { endPoint } = edge.sections![0];

    const drawingPath = {
        x: 0,
        y: 0
    };

    function drawArrow() {
        const svgArrowVisualAdjustment = -0.9;
        const svgArrowX = -7;
        const svgArrowY = 3;

        return (
            <polygon
                points={`${endPoint.x + svgArrowVisualAdjustment},${endPoint.y} ${endPoint.x + svgArrowX},${
                    endPoint.y + svgArrowY
                } ${endPoint.x + svgArrowX},${endPoint.y - svgArrowY}`}
            />
        );
    }

    if (!bendPoints) {
        // No Bend Points
        // Start point to end point
        drawingPath.x = endPoint.x - startPoint.x;
        drawingPath.y = endPoint.y - startPoint.y;
        return (
            <g className="g-tasks-graph-general g-tasks-graph-edge">
                <path
                    key={`${startPoint.x + startPoint.y + drawingPath.x + drawingPath.y}`}
                    d={`m${startPoint.x} ${startPoint.y} l${drawingPath.x} ${drawingPath.y}`}
                />
                {drawArrow()}
            </g>
        );
    }
    // At least 1 Bend Point exists
    // Start point to first bend point - Bend point to bend point - Bend point to end point
    const lastBendPoint = { ...bendPoints[bendPoints.length - 1] };
    const lastDrawingPath = { ...drawingPath };
    drawingPath.x = bendPoints[0].x - startPoint.x;
    drawingPath.y = bendPoints[0].y - startPoint.y;
    lastDrawingPath.x = endPoint.x - lastBendPoint.x;
    lastDrawingPath.y = endPoint.y - lastBendPoint.y;
    return (
        <g className="g-tasks-graph-general g-tasks-graph-edge">
            <path
                key={`${startPoint.x + startPoint.y + drawingPath.x + drawingPath.y}`}
                d={`m${startPoint.x} ${startPoint.y} l${drawingPath.x} ${drawingPath.y}`}
            />
            {bendPoints.map((bendPoint, index) => {
                // Already covered first index - Will draw nothing in the first iteration
                if (index !== 0) {
                    const prevBendPoint = { ...bendPoints[index - 1] };
                    drawingPath.x = bendPoint.x - prevBendPoint.x;
                    drawingPath.y = bendPoint.y - prevBendPoint.y;
                    return (
                        <path
                            key={`${bendPoint.x + bendPoint.y + drawingPath.x + drawingPath.y}`}
                            d={`m${prevBendPoint.x} ${prevBendPoint.y} l${drawingPath.x} ${drawingPath.y}`}
                        />
                    );
                }
                return undefined;
            })}
            <path
                key={`${endPoint.x + endPoint.y + drawingPath.x + drawingPath.y}`}
                d={`m${lastBendPoint.x} ${lastBendPoint.y} l${lastDrawingPath.x} ${lastDrawingPath.y}`}
            />
            {drawArrow()}
        </g>
    );
};

export default GraphEdge;
