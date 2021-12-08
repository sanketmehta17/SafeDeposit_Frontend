/* Author: Dhrumil Amish Shah (B00857606) */
import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import { CssBaseline, Grid, Paper, TextField, Typography, Button, CircularProgress, Card, CardContent } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { publishMessage, pullDelivery } from '../../apis/MessagePassingAPIs';
import useStyles from './styles';


AWS.config.update({
    region: process.env.REACT_APP_AWS_REGION,
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

export const Home = () => {
    const [messageData, setMessageData] = useState({ message: '' });
    const [messagesReceived, setMessagesReceived] = useState([]);
    const [errors, setErrors] = useState({ messageValid: false });
    const userReceivedProps = useLocation().state;
    const classes = useStyles();

    useEffect(() => {
        pullMessages();
    }, []);

    const pullMessages = async () => {
        const safeDepositId = userReceivedProps.safeDepositId;
        const emailId = userReceivedProps.email;
        const sameSafeDepositUsers = {
            TableName: "user",
            FilterExpression: "#safeDepositId = :safeDepositId and not #emailId = :emailId",
            ExpressionAttributeNames: {
                "#safeDepositId": "safeDepositId",
                "#emailId": "email",
            },
            ExpressionAttributeValues: {
                ":safeDepositId": safeDepositId,
                ":emailId": emailId,
            }
        };
        const sameSafeDepositUsersData = await documentClient.scan(sameSafeDepositUsers).promise();
        var msgs = [...messagesReceived];
        for (var i = 0; i < sameSafeDepositUsersData.Items.length; ++i) {
            const userData = {};
            userData["topicName"] = sameSafeDepositUsersData["Items"][i].topicName;
            userData["userId"] = userReceivedProps.userId;
            const receivedMessagesData = await pullDelivery(userData);
            msgs = msgs.concat(receivedMessagesData.data.payload);
        }
        console.log(msgs);
        setMessagesReceived(msgs);
    };

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
            user["message"] = `${userReceivedProps.firstName} ${userReceivedProps.lastName}: ${messageData.message}`;
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
            <iframe width="50%" height="50%" src="https://datastudio.google.com/embed/reporting/e5461c66-61cb-4669-85f5-019f7f17fc86/page/gwMhC" />
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
                            Publish Message From {userReceivedProps.firstName}
                        </Button>
                    </form>
                </div>
                {!messagesReceived.length ?
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent:'center' }}>
                        <Typography>Waiting for new messages ... :) </Typography>
                        <CircularProgress className={classes.circularProgress} /></div> :
                    (<Grid className={classes.container}
                        container alignItems="center"
                        spacing={1}>
                        {messagesReceived.map((messageReceived, index) => {
                            return <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                                <div style={{ marginLeft: "16px", marginRight: "16px" }}>
                                    <Card elevation={6} component={Paper}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: 14 }} color="primary" gutterBottom>
                                                {messageReceived.split(':')[0]}
                                            </Typography>
                                            <Typography variant="h5" component="div">
                                                {messageReceived.split(':')[1]}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Grid>
                        })}
                    </Grid>)}
            </Grid>
        </Grid>
    );
};