<!--[if IE 8 ]><html class="ie" xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-US" lang="en-US"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!-->
<!DOCTYPE html>
<html lang="en-US">
    <!--<![endif]-->

    <head>
        <meta charset="utf-8">
        <title>LIT Coimbra</title>
        <meta content="yes" name="apple-mobile-web-app-capable">
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta content="LIT Coimbra" name="author">
        <meta content="A tua nova casa!" name="description">
        <meta content="LIT, Coimbra, Discoteca, Bar" name="keywords">
        <!--
        <meta content="ThemeWagon">
        <meta content="ThemeWagon">
        <meta content="website">
        <meta content="index.php">
        <meta content="summary" name="twitter:card">
        <meta content="@themewagon" name="twitter:site">
        <meta content="@themewagon" name="twitter:creator">
        <meta content="ThemeWagon" name="twitter:title">
        <meta content="Imminent - The most spectacular coming soon template!" name="twitter:description">
        
        <link href="favicon.png" rel="shortcut icon" type="image/png">
        -->

        <!--[if lt IE 9]>
            <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        
        <!-- CSS -->
        <link href='https://fonts.googleapis.com/css?family=Roboto:400,100,900' rel='stylesheet' type='text/css'><!-- Styles -->
        <link href="css/loader.css" rel="stylesheet" type="text/css">
        <link href="css/normalize.css" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="css/font-awesome.min.css">
        <link href="css/style.css" rel="stylesheet" type="text/css">
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="css/ie.css" />
        <![endif]-->
        <!-- Javascript -->

        <script src="js/jquery.js"></script>
    </head>
    <body>
        <div class="preloader">
            <div class="loading">
                <h2>
                    Loading...
                </h2>
                <span class="progress"></span>
            </div>
        </div>
        
        <video autoplay muted loop playsinline class="video">
            <source src="videos/Movie_lowres720.mp4" type="video/mp4">
            <source src="videos/Movie_lowres720.webm" type="video/webm">
        </video>

        <div class="wrapper">
            
            <ul class="scene unselectable" data-friction-x="0.1" data-friction-y="0.1" data-scalar-x="25" data-scalar-y="15" id="scene">
                <li class="layer" data-depth="0.00"></li>
                <!-- BG -->
                <li class="layer" data-depth="0.10">
                    <div class="background"></div>
                </li>

                <!-- Hero -->
                <li class="layer" data-depth="0.20">
                    <div class="title">
                        <h2></h2>
                        <!--<span class="line"></span>-->
                    </div>
                </li>
                <li class="layer" data-depth="0.25">
                    <div class="sphere">
                        <img alt="sphere" src="images/logo.png">
                    </div>
                </li>
                <li class="layer" data-depth="0.30">
                    <div class="hero">
                        <!--<h1 id="countdown"></h1>-->

                        <p class="sub-title"></p>
                    </div>
                </li>
                
                <!-- Flakes -->
                <li class="layer" data-depth="0.40">
                    <div class="depth-1 flake1">
                        <img alt="flake" src="images/flakes/depth1/flakes1.png">
                    </div>

                    <div class="depth-1 flake2">
                        <img alt="flake" src="images/flakes/depth1/flakes2.png">
                    </div>

                    <div class="depth-1 flake3">
                        <img alt="flake" src="images/flakes/depth1/flakes3.png">
                    </div>

                    <div class="depth-1 flake4">
                        <img alt="flake" src="images/flakes/depth1/flakes4.png">
                    </div>
                </li>
                <li class="layer" data-depth="0.50">
                    <div class="depth-2 flake1">
                        <img alt="flake" src="images/flakes/depth2/flakes1.png">
                    </div>

                    <div class="depth-2 flake2">
                        <img alt="flake" src="images/flakes/depth2/flakes2.png">
                    </div>
                </li>
                <li class="layer" data-depth="0.60">
                    <div class="depth-3 flake1">
                        <img alt="flake" src="images/flakes/depth3/flakes1.png">
                    </div>

                    <div class="depth-3 flake2">
                        <img alt="flake" src="images/flakes/depth3/flakes2.png">
                    </div>

                    <div class="depth-3 flake3">
                        <img alt="flake" src="images/flakes/depth3/flakes3.png">
                    </div>

                    <div class="depth-3 flake4">
                        <img alt="flake" src="images/flakes/depth3/flakes4.png">
                    </div>
                </li>
                <li class="layer" data-depth="0.80">
                    <div class="depth-4">
                        <img alt="flake" src="images/flakes/depth4/flakes.png">
                    </div>
                </li>
                <li class="layer" data-depth="1.00">
                    <div class="depth-5">
                        <img alt="flake" src="images/flakes/depth5/flakes.png">
                    </div>
                </li>
                
                <!-- Contact -->
                <li class="layer" data-depth="0.20">
                    <div class="contact">
                        <ul class="icons">

                            <li>
                                <a class="instagram" href="https://www.instagram.com/lit.coimbra/" target="_blank"><i class="fa fa-instagram"></i></a>
                            </li>

                        </ul>
                        <br>
                        <a class="mail" href="mailto:info@litcoimbra.pt">info@litcoimbra.pt</a>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Javascript -->
        <script src="js/plugins.js"></script> 
        <!--<script src="js/jquery.countdown.min.js"></script>-->
        <script src="js/main.js"></script>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SRPVR3V7FX"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SRPVR3V7FX');
        </script>
    </body>
</html>