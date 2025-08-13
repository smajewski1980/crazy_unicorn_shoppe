--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-08-13 10:18:45

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 17099)
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    product_id integer NOT NULL,
    current_qty integer NOT NULL,
    min_qty integer NOT NULL,
    max_qty integer NOT NULL
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- TOC entry 4942 (class 0 OID 17099)
-- Dependencies: 226
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.inventory VALUES (2, 10, 3, 10);
INSERT INTO public.inventory VALUES (33, 50, 10, 50);
INSERT INTO public.inventory VALUES (31, 10, 3, 10);
INSERT INTO public.inventory VALUES (38, 5, 2, 5);
INSERT INTO public.inventory VALUES (46, 10, 5, 10);
INSERT INTO public.inventory VALUES (49, 3, 1, 3);
INSERT INTO public.inventory VALUES (50, 2, 1, 2);
INSERT INTO public.inventory VALUES (43, 10, 5, 10);
INSERT INTO public.inventory VALUES (44, 9, 5, 10);
INSERT INTO public.inventory VALUES (41, 20, 5, 20);
INSERT INTO public.inventory VALUES (32, 5, 1, 5);
INSERT INTO public.inventory VALUES (35, 30, 10, 30);
INSERT INTO public.inventory VALUES (37, 10, 5, 10);
INSERT INTO public.inventory VALUES (47, 10, 5, 10);
INSERT INTO public.inventory VALUES (48, 10, 5, 10);
INSERT INTO public.inventory VALUES (42, 3, 1, 3);
INSERT INTO public.inventory VALUES (36, 2, 1, 2);
INSERT INTO public.inventory VALUES (24, 3, 2, 7);
INSERT INTO public.inventory VALUES (1, 10, 3, 10);
INSERT INTO public.inventory VALUES (4, 4, 2, 5);
INSERT INTO public.inventory VALUES (3, 24, 10, 30);
INSERT INTO public.inventory VALUES (30, 9, 3, 10);
INSERT INTO public.inventory VALUES (39, 10, 5, 10);
INSERT INTO public.inventory VALUES (45, 10, 5, 10);
INSERT INTO public.inventory VALUES (40, 3, 1, 3);
INSERT INTO public.inventory VALUES (34, 20, 5, 20);


--
-- TOC entry 4788 (class 2606 OID 17103)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (product_id);


--
-- TOC entry 4789 (class 2606 OID 17164)
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


-- Completed on 2025-08-13 10:18:46

--
-- PostgreSQL database dump complete
--

