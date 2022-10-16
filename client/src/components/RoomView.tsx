import React from 'react';
import { useSearchParams } from 'react-router-dom';

const RoomView = () => {
    const [params] = useSearchParams();
    const id = parseInt(params.get('id') || '');

    if (!id || isNaN(id)) {
        // TODO; navigate to error page
    }

    return (
        <div>
            Show Page {id}
        </div>
    );
};

export default RoomView;
