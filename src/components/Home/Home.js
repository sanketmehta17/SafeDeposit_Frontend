/* Author: Dhrumil Amish Shah (B00857606) */
import React from 'react';
import { useLocation } from 'react-router-dom';
import useStyles from './styles';

export const Home = () => {
    const userReceivedProps = useLocation().state;
    console.log(userReceivedProps);
    return (
        <div>
            <div>Home Page</div>
            <div>{userReceivedProps.firstName}</div>
            <div>{userReceivedProps.lastName}</div>
            <div>{userReceivedProps.email}</div>
            <div>{userReceivedProps.answer1}</div>
            <div>{userReceivedProps.answer2}</div>
            <div>{userReceivedProps.answer3}</div>
        </div>
    );
};