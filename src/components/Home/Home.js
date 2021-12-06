/* Author: Dhrumil Amish Shah (B00857606) */
import React, { useState } from 'react';
import { CssBaseline, Grid, Paper, TextField, Typography, Button } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { publishMessage } from '../../apis/MessagePassingAPIs';
import useStyles from './styles';

export const Home = () => {
    const [messageData, setMessageData] = useState({ message: '' });
    const [errors, setErrors] = useState({ messageValid: false });
    const userReceivedProps = useLocation().state;
    const classes = useStyles();

    const fieldsValid = () => {
        if (errors.messageValid) {
            return true;
        } else {
            return false;
        }
    }

    const validate = (e) => {
        switch (e.target.name) {
            case 'message':
                if (e.target.value === "" || e.target.value === null) {
                    errors["message"] = "Message is required."
                    errors["messageValid"] = false;
                } else {
                    errors["message"] = "";
                    errors["messageValid"] = true;
                }
                break;
            default:
                break;
        }
        setErrors(errors);
    };

    const onChange = (e) => {
        validate(e);
        setMessageData({
            ...messageData,
            [e.target.name]: e.target.value
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (fieldsValid()) {
            const user = {}
            user["topicName"] = userReceivedProps.topicName;
            user["message"] = messageData.message;
            const publishMessageData = await publishMessage(user);
            if (publishMessageData.data.success) {
                console.log("Message published successfully.");
                console.log(publishMessageData.data.message);
                setMessageData({ message: '' });
                setErrors({ messageValid: false });
            }
        }
    };

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square className={classes.formBackground}>
                <div className={classes.paper}>
                    <Typography component="h3" variant="h3" fontWeight="fontWeightBold">
                        Message Other Users
                    </Typography>
                    <form onSubmit={onSubmit} className={classes.form} noValidate>
                        <div className={classes.publishMessage}>Publish message to topic: {userReceivedProps.topicName}</div>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="message"
                            type="text"
                            name="message"
                            label="Type your message here"
                            variant="outlined"
                            required
                            value={messageData.message}
                            onChange={onChange}
                            error={errors["message"] ? true : false}
                            helperText={errors["message"]}
                        />
                        <Button disabled={!fieldsValid()} className={classes.submit} color="secondary" variant="contained" fullWidth type="submit">
                            Publish Message
                        </Button>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
};